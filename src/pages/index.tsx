import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { prisma } from "~/server/db";
import Image from "next/image";
import { useState } from "react";

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma },
    transformer: superjson, // optional - adds superjson serialization
  });
  // prefetch `post.byId`
  await helpers.application.getAll.prefetch();
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 60,
  };
}

const Home: NextPage = () => {
  const applications = api.application.getAll.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  if (applications.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }
  const { data } = applications;

  return (
    <>
      <Head>
        <title>Grin&apos;s HomePage</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" type="image/png" href="/favicon.png"></link>
      </Head>
      <div className="fixed right-[4%] top-4 md:top-14 z-10">
        <input className="tgl tgl-flip" id="qieh" type="checkbox"></input>
        <label
          onClick={() => setActiveIndex(activeIndex === 0 ? 1 : 0)}
          className="tgl-btn"
          data-tg-on={data[0]?.name}
          data-tg-off={data[1]?.name}
          htmlFor="qieh"
        ></label>
      </div>
      <main className="absolute bottom-0 left-0 right-0 top-0 flex justify-center">
        <div className="container mt-28 flex justify-center px-4 lg:mt-36">
          <div className="grid auto-rows-min grid-cols-4 gap-x-1 gap-y-1 md:gap-x-12 md:gap-y-16 lg:grid-cols-5 xl:grid-cols-6">
            {data[activeIndex]?.apps.map((app) => (
              <Link href={app.url} key={app.id} target="_blank">
                <div className="relative">
                  <figure className="">
                    <Image
                      src={app.logo}
                      alt={app.name}
                      width="128"
                      height="128"
                      className="h-20 w-20 hover:animate-shake_bounce sm:h-32 sm:w-32"
                    />
                    <figcaption className="text-center text-xs md:text-sm text-white shadow-black drop-shadow-lg">
                      {app.name}
                    </figcaption>
                  </figure>
                  {app.requireLogin && (
                    <Image
                      src="/images/auth.png"
                      alt=""
                      width="20"
                      height="20"
                      className="absolute right-1 top-1 h-5 w-5"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
