import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "About",
    path: "/about",
    newTab: false,
  },
  {
    id: 3,
    title: "Pricing",
    path: "/pricing",
    newTab: false,
  },
  {
    id: 5,
    title: "Contact",
    path: "/contact",
    newTab: false,
  },
  {
    id: 5,
    title: "Blog",
    path: "/blogs",
    newTab: false,
    hidden: true,
  },
  {
    id: 6,
    title: "Pages",
    newTab: false,
    hidden: true,
    submenu: [
      {
        id: 61,
        title: "About Page",
        path: "/about",
        newTab: false,
      },
      {
        id: 62,
        title: "Pricing Page",
        path: "/pricing",
        newTab: false,
      },
      {
        id: 63,
        title: "Contact Page",
        path: "/contact",
        newTab: false,
      },
      {
        id: 64,
        title: "Blog Grid Page",
        path: "/blogs",
        newTab: false,
      },
      {
        id: 66,
        title: "Sign Up Page",
        path: "/signup",
        newTab: false,
      },
      {
        id: 67,
        title: "Sign In Page",
        path: "/signin",
        newTab: false,
      },
      {
        id: 68,
        title: "Error Page",
        path: "/error",
        newTab: false,
      },
    ],
  },
  {
    id: 7,
    title: "For You",
    newTab: false,
    submenu: [
      {
        id: 71,
        title: "Lawyers",
        path: "/for-you/lawyers",
        newTab: false,
      },
      {
        id: 72,
        title: "HR",
        path: "/for-you/hr",
        newTab: false,
      },
      {
        id: 73,
        title: "SaaS",
        path: "/for-you/saas",
        newTab: false,
      },
      {
        id: 74,
        title: "Startups",
        path: "/for-you/startups",
        newTab: false,
      },
    ],
  },
];
export default menuData;
