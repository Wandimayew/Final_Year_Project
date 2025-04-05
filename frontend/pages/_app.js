import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../app/globals.css"; // Include your global styles if needed
export const dynamic = "force-dynamic";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
