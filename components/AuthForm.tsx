"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CustomField from "./Customfields";
import { authFormSchema } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { getLoggedInUser, signIn, signUp } from "@/lib/actions/user.actions";

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      state: "",
      postalCode: "",
      dateOfBirth: "",
      ssn: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Sign up with upWrite & Create plaid token.

      if (type === "sign-up") {
        const newUser = await signUp(data);

        setUser(newUser);
      }

      if (type === "sign-in") {
        const response = await signIn({
          email: data.email,
          password: data.password,
        });

        if (response) router.push("/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <div className="flex cursor-pointer items-center gap-1">
          <Image src="/icons/logo.svg" width={34} height={34} alt="Horizon" />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Horizon
          </h1>
        </div>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className=" text-24 lg:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user ? "Link YOur account to get started" : "Please enter details"}
          </p>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">{/*Plaid Accoutt*/}</div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="flex gap-5">
                    <CustomField
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      type="text"
                      placeholder="Enter your First Name"
                      id="name"
                      autoComplete=""
                    />
                    <CustomField
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      type="text"
                      placeholder="Enter your Last Name"
                      id="name"
                      autoComplete=""
                    />
                  </div>
                  <CustomField
                    control={form.control}
                    name="address1"
                    label="Address 1"
                    type="text"
                    placeholder="Enter your specific address"
                    id="name"
                    autoComplete=""
                  />
                  <CustomField
                    control={form.control}
                    name="address2"
                    label="Address 2"
                    type="text"
                    placeholder="Enter your specific address"
                    id="name"
                    autoComplete=""
                  />
                  <CustomField
                    control={form.control}
                    name="city"
                    label="City "
                    type="text"
                    placeholder="Enter your City"
                    id="name"
                    autoComplete=""
                  />
                  <div className="flex gap-5">
                    <CustomField
                      control={form.control}
                      name="state"
                      label="State"
                      type="text"
                      placeholder="ex: Maharashtra"
                      id="name"
                      autoComplete=""
                    />
                    <CustomField
                      control={form.control}
                      name="postalCode"
                      label="Postal"
                      type="number"
                      placeholder="ex: 201409"
                      id="name"
                      autoComplete=""
                    />
                  </div>
                  <div className="flex gap-20">
                    <CustomField
                      control={form.control}
                      name="dateOfBirth"
                      label="Date Of Birth"
                      type="date"
                      placeholder=""
                      id="name"
                      autoComplete=""
                    />
                    <CustomField
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      type="number"
                      placeholder="ex: 223"
                      id="name"
                      autoComplete=""
                    />
                  </div>
                </>
              )}
              <CustomField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                id="name"
                autoComplete=""
              />
              <CustomField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                id="name"
                autoComplete="current-password"
              />

              <div className="flex flex-col gap-4">
                <Button type="submit" className="form-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      &nbsp; Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link"
            >
              {type === "sign-in" ? "Sign Up" : "Sign in"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
