"use client";
import React, { useEffect, useRef } from "react";
import Logo from "@/assests/Logo1.svg";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setDataObject, setIsLogin, setIsUserSR } from "@/redux/slice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Link from "next/link";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const userStateData = useSelector((state: RootState) => state?.wallet);

  const routesToHideNavbar = ["/", "/login", "/auth/register", "/auth/login"];
  const shouldHideNavbar = routesToHideNavbar.includes(pathname); // Check for exact match

  // Handle Sign Out
  const handleSignOut = () => {
    // Dispatch to reset the state
    dispatch(setIsLogin(false));
    dispatch(setIsUserSR(false));
    dispatch(setDataObject(undefined));

    // Show toast message
    toast.success("Successfully signed out!");

    // Navigate to home or login page
    router.push("/");
  };

  // Create a ref to track if event listener has been added
  const eventListenerAdded = useRef(false);

  // Handle wallet address change event
  useEffect(() => {
    const handleChange = (event: CustomEvent<{ wallet_address: string }>) => {
      if (
        event.detail.wallet_address !==
        (userStateData?.dataObject?.walletAddress as string)
      ) {
        toast.error(
          "Attention: Your wallet address has changed. Please log in again."
        );
        handleSignOut();
      }
    };

    if (userStateData?.isLogin && !eventListenerAdded.current) {
      // Add custom event listener
      document.addEventListener("Wallet Change", handleChange as EventListener);
      eventListenerAdded.current = true;
    }

    return () => {
      if (eventListenerAdded.current) {
        document.removeEventListener(
          "Wallet Change",
          handleChange as EventListener
        );
        eventListenerAdded.current = false;
      }
    };
  }, [userStateData?.isLogin, userStateData?.dataObject?.walletAddress]);

  if (shouldHideNavbar) return null;

  return (
    <nav className="px-0 md:px-0 lg:px-6 w-full bg-black shadow-[0px_1px_15px_0px_rgba(255,255,255,0.2)] backdrop-blur-sm z-50">
      <div className=" mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-white font-bold text-lg">
          <Image
            src={Logo}
            alt="sulmine-logo"
            width={0}
            height={0}
            className="w-[70%] md:w-[60%]"
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-5">
          <Link
            href="/Support"
            className="font-medium text-base text-white px-8 py-2 rounded-xl border-2 border-gray-500
  transition-all duration-300 ease-in-out shadow-md 
  hover:border-[#572EAC] hover:text-white hover:bg-[#1a1a1a] hover:shadow-lg"
          >
            Help
          </Link>
          {/* Connect Wallet Button */}
          {/* <Link
            href="/StakeUnstake"
            className="whitespace-nowrap bg-gradient-to-r from-[#572EAC] to-[#8922B3] text-sm md:text-base text-white font-medium px-3 md:px-6 py-2 rounded-lg shadow-lg 
        hover:scale-105 transition-transform"
          >
          Unstake
          </Link> */}

          <button
            onClick={handleSignOut}
            className="relative p-0.5 inline-flex items-center justify-center font-bold overflow-hidden group rounded-xl"
          >
            <span className="w-full h-full bg-gradient-to-r from-[#572EAC] to-[#8922B3] group-hover:from-[#572EAC] group-hover:to-[#8922B3] absolute"></span>
            <span className="relative px-3 md:px-6 py-2 transition-all ease-out bg-gray-900 rounded-xl group-hover:bg-opacity-0 duration-400">
              <span className="relative text-white text-nowrap">Sign out</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
