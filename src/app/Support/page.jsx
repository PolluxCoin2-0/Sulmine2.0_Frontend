"use client";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import Compressor from "browser-image-compression";
import Loader from "../components/Loader";
import { getPolinkweb } from "../../lib/connectWallet";
import axios from "axios";
import { supportDataApi } from "@/api/apiFunctions";

const Support = () => {
	const [walletAddress, setWalletAddress] = useState("");
	const [email, setEmail] = useState("");
	const [description, setDescription] = useState("");
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef(null);
	const [walletLoading, setWalletLoading] = useState(false);
    
	const isFormValid = walletAddress && email && description && files.length > 0;

	const handleWalletAddress = async () => {
		if (walletLoading) {
			toast.warning("Fetching wallet address...");
			return;
		}

		setWalletLoading(true);
		try {
			const walletAddress = await getPolinkweb();
			if (walletAddress?.wallet_address) {
				setWalletAddress(walletAddress?.wallet_address);
			}
		} catch (error) {
			toast.error("Something went wrong");
			throw error;
		} finally {
			setWalletLoading(false);
		}
	};

	const handleFileUpload = async (event) => {
		const uploadedFiles = Array.from(event.target.files);
		const validFiles = [];

		for (let file of uploadedFiles) {
			if (file.size > 3 * 1024 * 1024) {
				toast.warn(`${file.name} is too large! Compressing...`);
				try {
					const compressedFile = await Compressor(file, {
						maxSizeMB: 3,
						maxWidthOrHeight: 1024,
						useWebWorker: true,
					});
					validFiles.push(compressedFile);
				} catch (error) {
					console.log(error)
					toast.error(`Compression failed for ${file.name}`);
				}
			} else {
				validFiles.push(file);
			}
		}
		setFiles(validFiles);
	};
  
    const valdiateAddress = async(address)=>{
        try {
            const BODY = {
                "address": address,
                "visible": true
            }
            const data = await fetch("https://fullnode-one.poxscan.io/wallet/validateaddress",{method: 'POST', body:JSON.stringify(BODY)}
            )
            const a = await data.json();
            console.log({a});
            
        } catch (error) {
            console.log(error)
        }
    }

	const handleSubmit = async () => {
		if (!valdiateAddress(walletAddress)) {
			toast.error("Invalid wallet address!");
			return;
		}

		setLoading(true);

		try {
			const uploadedFiles = [];

			// Upload files one by one
			for (let file of files) {
				const formData = new FormData();
				formData.append("pollux_image", file);

				console.log("Uploading file:", file);

				const uploadResponse = await axios.post(
					`https://governance.poxscan.io/token/uploadLogo`,
					formData,
					{
						headers: {
							"Content-Type":
								"multipart/form-data; boundary=<calculated when request is sent>",
						},
					}
				);
				console.log("Uploaded file response:", uploadResponse);

				if (
					uploadResponse?.data?.status_code === "1" &&
					uploadResponse?.data?.message?.image
				) {
					// Collect uploaded image URLs
					uploadedFiles.push(uploadResponse.data.message.image);
				} else {
					toast.error("Error uploading a file!");
					throw new Error("File upload failed");
				}
			}

			// Prepare payload with uploaded file URLs
			const payload = {
				name: walletAddress,
				email,
				description,
				attachments: uploadedFiles,
			};

			// Send support request with file URLs
			const result = await supportDataApi(payload);
			console.log("Support request result:", result);

			toast.success("Support request sent successfully!");
		} catch (error) {
			console.error("Error submitting support request:", error);
			toast.error("Failed to submit support request. Please try again!");
		} finally {
			setWalletAddress("");
			setEmail("");
			setDescription("");
			setFiles([]);
			setLoading(false);
		}
	};
	

	return (
        <div className="bg-black min-h-screen flex justify-center items-center px-2 ">
		<div className='bg-[#151515] border border-[#434343] text-white rounded-3xl py-6 px-4 lg:px-8 w-full mb-4 max-w-6xl'>
			<div className='flex justify-center'>
				<h1 className=' text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-white to-[#572EAC] inline-block text-transparent bg-clip-text text-center'>
					Get in Touch
				</h1>
			</div>

			<p className='mb-6 text-gray-400 text-center text-sm md:text-base'>
				Reach out, and let&apos;s create a universe of possibilities together!
			</p>

			<div className='space-y-4'>
				<div className='flex flex-col md:flex-row gap-4'>
					<input
						type='text'
						className='w-full md:w-1/2 p-3 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-400'
						placeholder='Wallet Address'
						value={walletAddress}
						onClick={walletAddress ? undefined : handleWalletAddress}
					/>
					<input
						type='email'
						className='w-full md:w-1/2 p-3 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-400'
						placeholder='Email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<textarea
					className='w-full p-3 bg-gray-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-gray-400'
					placeholder='Describe your issue...'
					rows={10}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>

				{/* File Upload */}
				<div
					className='border-2 border-dashed border-[#434343] bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer'
					onClick={() => fileInputRef.current.click()}
				>
					<input
						ref={fileInputRef}
						type='file'
						multiple
						className='hidden'
						onChange={handleFileUpload}
					/>
					<i className='fa fa-folder-open fa-3x text-[#eef200]'></i>
					<p className='text-gray-400 text-sm'>Attach your files here (Only .JPEG, .JPG and .PNG allowed)</p>
					{files.length > 0 && (
						<p className='text-[#7835ff] font-bold mt-2'>{files.length} file(s) added</p>
					)}
				</div>

				{/* Submit Button */}
				<button
					onClick={handleSubmit}
					className={`flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-lg transition-all w-full
            ${
							isFormValid
								? "bg-[#572EAC] hover:bg-[#582eaca6] text-white"
								: "bg-gray-600 text-gray-400 cursor-not-allowed"
						}
          `}
					disabled={!isFormValid || loading}
				>
					{loading ? <Loader /> : "Send it to the Sulmine"}
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
						className='w-6 h-6'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z'
						/>
					</svg>
				</button>
			</div>
		</div>
        </div>
	);
};

export default Support;
