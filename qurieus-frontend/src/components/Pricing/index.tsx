"use client";
import SectionTitle from "../Common/SectionTitle";
import PricingBox from "./PricingBox";

interface PricingProps {
  plans: any[];
  user: any;
}

const Pricing = ({ plans, user }: PricingProps) => {
  return (
    <section
      id="pricing"
      className="relative z-20 overflow-hidden bg-white pb-12 pt-20 dark:bg-dark lg:pb-[90px] lg:pt-[120px]"
    >
      <div className="container">
        <div className="mb-[60px]">
          <SectionTitle
            subtitle="Pricing Table"
            title="Our Pricing Plan"
            paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
            center
          />
        </div>

        <div className="-mx-4 flex flex-wrap justify-center">
          {plans.map((plan, i) => (
            <PricingBox key={plan.id} plan={plan} user={user} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
