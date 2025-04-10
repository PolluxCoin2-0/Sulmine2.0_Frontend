"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { WalletIcon } from "@heroicons/react/24/outline";
import Logo from "@/assests/Logo1.svg";
import Link from "next/link";
import { toast } from "react-toastify";
import { getPolinkweb } from "@/lib/connectWallet";
import { useRouter } from "next/navigation";
import { getUserIsSR, loginApi } from "@/api/apiFunctions";
import { useDispatch, useSelector } from "react-redux";
import { setDataObject, setIsLogin, setIsUserSR } from "@/redux/slice";
import { RootState } from "@/redux/store";
import Loader from "@/app/components/Loader";

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userStateData = useSelector((state: RootState) => state?.wallet);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [srWalletAddress, setSrWalletAddress] = useState<string | null>(null);
  const [normalWalletAddress, setNormalWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userStateData?.isLogin) {
      router.push("/dashboard");
    }
  }, [userStateData?.isLogin, router]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) {
      toast.warning("Login in progress");
      return;
    }

    setIsLoading(true);
    try {
      const walletAddress = await getPolinkweb();
      if (!walletAddress || !walletAddress.wallet_address) throw new Error("Wallet address not found.");

      const userWalletAddress = walletAddress.wallet_address;
      setNormalWalletAddress(userWalletAddress);

      const userSRApiData = await getUserIsSR(userWalletAddress);
      if (userSRApiData?.message === "adderss undercontrol found") {
        setSrWalletAddress(userSRApiData?.data);
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      await proceedWithLogin(userWalletAddress);
    } catch (error) {
      toast.error("Invalid wallet address or login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithLogin = async (walletAddress: string) => {
    try {
      const loginApiData = await loginApi(walletAddress);
      if (loginApiData?.message !== "Login Successfully") throw new Error("Login failed.");

      dispatch(setIsLogin(true));
      dispatch(setDataObject({ ...loginApiData?.data, walletAddress }));
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login failed.");
    }
  };

  const handleModalProceed = async () => {
    if (!selectedOption) {
      toast.warning("Please select an option to proceed.");
      return;
    }

    const selectedWallet = selectedOption === "option1" ? srWalletAddress : normalWalletAddress;
    if (selectedOption === "option1") dispatch(setIsUserSR(true));
    await proceedWithLogin(selectedWallet as string);
    setShowModal(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-black to-white">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(50,50,50,0.7) 30%, rgba(200,200,200,0.7) 63.5%, rgba(255,255,255,0.85) 100%)",
        }}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white text-black rounded-lg p-6 w-11/12 max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Confirm SR Wallet</h3>
            <p className="mb-4">We detected an SR wallet. Please select an option to proceed:</p>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="srWalletOption"
                  value="option1"
                  onChange={() => setSelectedOption("option1")}
                />
                <span>
                  <strong>Under Control Wallet:</strong>{" "}
                  {srWalletAddress ? `${srWalletAddress.slice(0, 6)}...${srWalletAddress.slice(-6)}` : ""}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="srWalletOption"
                  value="option2"
                  onChange={() => setSelectedOption("option2")}
                />
                <span>
                  <strong>Active Wallet:</strong>{" "}
                  {normalWalletAddress ? `${normalWalletAddress.slice(0, 6)}...${normalWalletAddress.slice(-6)}` : ""}
                </span>
              </label>
            </div>
            <button
              onClick={handleModalProceed}
              className="mt-6 w-full py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-900 transition"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl p-6 md:p-10 border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <Image src={Logo} alt="Sulmine Logo" width={180} height={50} className="mx-auto" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/auth/register">
            <button className="w-full py-3 rounded-xl text-black font-bold bg-white border border-gray-300 hover:bg-gray-100 transition duration-200">
              Register
            </button>
          </Link>

          {isLoading ? (
            <div className="w-full flex justify-center rounded-xl bg-gray-800/40 p-3">
              <Loader />
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl font-semibold bg-black text-white border border-white/30 hover:bg-gray-900 transition duration-300 flex items-center justify-center"
            >
              <WalletIcon className="h-6 w-6 mr-2" />
              Connect Wallet
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/70 text-xs">
          <p>By logging in, you agree to our</p>
          <Link href="#" className="text-white hover:underline">
            Terms & Conditions
          </Link>
        </div>
      </div>

      {/* Soft Background Animation Layer */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-tl from-white/20 to-black/50 opacity-30 animate-pulse" />
    </div>
  );
};

export default Login;
