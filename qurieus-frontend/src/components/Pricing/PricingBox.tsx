import axios from "axios";
import React from "react";
import OfferList from "./OfferList";
import { Price } from "@/types/price";

const PricingBox = ({ plan, user }: { plan: any; user: any }) => {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <div
        className="relative z-10 mb-10 overflow-hidden rounded-xl bg-white px-8 py-10 shadow-[0px_0px_40px_0px_rgba(0,0,0,0.08)] dark:bg-dark-2 sm:p-12 lg:px-6 lg:py-10 xl:p-14"
        data-wow-delay=".1s"
      >
        {plan.name === "Premium" && (
          <p className="absolute right-[-50px] top-[60px] inline-block -rotate-90 rounded-bl-md rounded-tl-md bg-primary px-5 py-2 text-base font-medium text-white">
            Recommended
          </p>
        )}
        <span className="mb-5 block text-xl font-medium text-dark dark:text-white">
          {plan.name}
        </span>
        <h2 className="mb-11 text-4xl font-semibold text-dark dark:text-white xl:text-[42px] xl:leading-[1.21]">
          <span className="text-xl font-medium">$ </span>
          <span className="-ml-1 -tracking-[2px]">
            {(plan.price).toLocaleString("en-US", {
              currency: plan.currency,
            })}
          </span>
          <span className="text-base font-normal text-body-color dark:text-dark-6">
            {" "}
            Per Month
          </span>
        </h2>

        <div className="mb-[50px]">
          <h3 className="mb-5 text-lg font-medium text-dark dark:text-white">
            Features
          </h3>
          <div className="mb-10">
            {plan?.features?.map((feature: string, i: number) => (
              <OfferList key={i} text={feature} />
            ))}
          </div>
        </div>
        <div className="w-full">
          {/* Paddle.js integration and guest/user logic will be added here */}
        </div>
      </div>
    </div>
  );
};

export default PricingBox;
