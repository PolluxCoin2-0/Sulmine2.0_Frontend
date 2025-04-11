// import Login from "./auth/login/page";

export default function Home() {
  return (
    // <Login/>
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-200 to-purple-600 text-black font-sans text-center">
    <h1 className="text-4xl font-bold mb-4">We’re Under Maintenance</h1>
    <p className="text-lg mb-8">
      Our site is currently undergoing some updates to serve you better.
      Please check back soon!
    </p>
    <div className="w-20 h-20 border-8 border-white border-t-purple-600 rounded-full animate-spin mb-8"></div>
    <div className="bg-white/10 p-4 rounded-lg text-center">
      <p className="text-lg italic">
      &quot;Patience is not the ability to wait, but the ability to keep a good
      attitude while waiting.&quot;
      </p>
      <p className="mt-2 text-sm">— Joyce Meyer</p>
    </div>
  </div>
  );
}
