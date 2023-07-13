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
    revalidate: 120,
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
      <main className="flex justify-center mt-28 lg:mt-60">
          <div className="container grid gap-4 grid-cols-[repeat(auto-fill,_minmax(5rem,_1fr))] sm:grid-cols-[repeat(auto-fill,_minmax(8rem,_1fr))]">
            {data[activeIndex]?.apps.map((app) => (
              <Link href={app.url} key={app.id} target="_blank">
                <div className="relative">
                  <figure className="">
                    <Image
                      src={app.logo}
                      alt={app.name}
                      width="128"
                      height="128"
                      className="w-20 h-20 hover:animate-shake_bounce sm:h-32 sm:w-32"
                    />
                    <figcaption className="text-xs text-center text-white md:text-sm shadow-black drop-shadow-lg">
                      {app.name}
                    </figcaption>
                  </figure>
                  {app.requireLogin && (
                    <Image
                      src="/images/auth.png"
                      alt=""
                      width="20"
                      height="20"
                      className="absolute w-5 h-5 sm:w-8 sm:h-8 left-16 top-1 sm:left-[6.5rem]  sm:top-2"
                    />
                  )}
                </div>
              </Link>
            ))}
        </div>
      </main>
    </>
  );
};

export default Home;
