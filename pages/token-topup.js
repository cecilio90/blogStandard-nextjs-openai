import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function TokenTopup() {
  const handleClick = async () => {
    const response = fetch('/api/addTokens', {
      method: "POST"
    });
  }

  return (
    <div>
      <h1>This is the token top up</h1>
      <button className="btn" onClick={handleClick}>Generate tokens</button>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
  console.log("entre")
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props
    }
  }
})