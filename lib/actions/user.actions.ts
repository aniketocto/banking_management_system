"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
   APPWRITE_DATABASE_ID: DATABASE_ID, 
   APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID, 
   APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID, 
  } = process.env;

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    return parseStringify(session);
  } catch (error) {
    console.error("Error", error);
  }
};

export const signUp = async ({password,...userData}: SignUpParams) => {
  const { email, firstName, lastName } = userData;

  let newUserAccount;
  try {
    //Mutation /Database /Make fetch

    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error('Error creating user')

      const dwollaCustomerUrl = await createDwollaCustomer({
        ...userData,
        type:'personal'
      })

      if(!dwollaCustomerUrl) throw new Error('Error creating dwolla customer')

      const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

      const newUser = await database.createDocument(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        ID.unique(),
        {
          ...userData,
          userId: newUserAccount.$id,
          dwollaCustomerUrl,
          dwollaCustomerId,
        }
      )


    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error", error);
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    console.log("user", result);

    return parseStringify(result);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };
    const res = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: res.data.link_token });
  } catch (error) {
    console.log(error);
  }
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();
    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        sharableId,
      }
    )

    return parseStringify(bankAccount);
  } catch (error) {
    console.log(error);
    
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    //Echange public token for access token and item ID
    const res = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = res.data.access_token;
    const itemId = res.data.item_id;

    //Get account Information from plaid using the access token
    const accountsRes = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsRes.data.accounts[0];

    //Create a processor token for Dwolla using the access token and account Id
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenRes = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenRes.data.processor_token;

    // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw Error;

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    // Revalidate the path to reflect the changes
    revalidatePath("/");

    // Return a success message
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.log("An error occurred while creating exchange token", error);
  }
};
