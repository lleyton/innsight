import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useInfiniteQuery, useQuery } from "react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Waypoint } from "react-waypoint";

enum Status {
  ONLINE,
  OFFLINE,
  PENDING,
}

interface Machine {
  id: string;
  name: string;
  status: Status;
  os: string;
}

const ServerCard: React.FC<{
  name: string;
  status: Status;
  os: string;
  onClick: () => void;
}> = ({ name, status, os, onClick }) => {
  return (
    <div
      className="p-5 bg-gray-100 rounded-md dark:bg-gray-800 cursor-pointer"
      onClick={onClick}
    >
      <h1 className="text-xl font-bold">{name}</h1>
      <h2>{os}</h2>
      <h3
        className={
          status === Status.ONLINE
            ? "text-green-400"
            : status === Status.PENDING
            ? "text-yellow-400"
            : "text-red-400"
        }
      >
        {status === Status.ONLINE
          ? "ONLINE"
          : status === Status.PENDING
          ? "PENDING"
          : "OFFLINE"}
      </h3>
    </div>
  );
};

const ServerContainer: React.FC<{ machine: Machine; token?: string }> = ({
  machine,
  token,
}) => {
  const { data, fetchNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery(
      ["logs", machine.name, token],
      async ({ pageParam = 0, queryKey: [_, name] }) => {
        const { data } = await axios.get(
          "https://innsight.innatical.com/logs?" +
            new URLSearchParams({ page: String(pageParam), hostname: name! }),
          {
            headers: {
              Authorization: token,
            },
          }
        );
        return data as string[];
      },
      {
        enabled: !!token,
        getNextPageParam: (_, pages) => pages.length,
      }
    );

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [ref.current]);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-5xl font-bold">{machine.name}</h1>
        <h2 className="text-2xl">{machine.os}</h2>
        <h3
          className={
            machine.status === Status.ONLINE
              ? "text-green-400"
              : machine.status === Status.PENDING
              ? "text-yellow-400"
              : "text-red-400"
          }
        >
          {machine.status === Status.ONLINE
            ? "ONLINE"
            : machine.status === Status.PENDING
            ? "PENDING"
            : "OFFLINE"}
        </h3>
      </div>
      <div
        className="bg-gray-100 rounded-md dark:bg-gray-800 flex-1 w-full p-5 flex flex-col overflow-y-auto"
        ref={ref}
      >
        <div className="mt-auto">
          <Waypoint
            onEnter={async () => {
              const current = ref.current;
              if (!isFetching && !isFetchingNextPage && current) {
                const height = current.scrollHeight;
                await fetchNextPage();
                if (current) {
                  current.scrollTop = current.scrollHeight - height;
                }
              }
            }}
          />
        </div>
        {data?.pages
          .reverse()
          .flat()
          .map((str, i) => (
            <p key={i}>{str}</p>
          ))}
      </div>
    </>
  );
};

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem("innsight-token");
    if (!token) router.push("/login");
    else setToken(token);
  }, []);

  const { data: status } = useQuery(
    ["status", token],
    async ({ queryKey: [_, token] }) => {
      const { data } = await axios.get(
        "https://innsight.innatical.com/status",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return data as Machine[];
    },
    {
      enabled: !!token,
    }
  );

  const [selected, setSelected] = useState<Machine>();

  return (
    <div className="h-screen flex dark:bg-gray-900 dark:text-white">
      <div className="p-5 gap-5 overflow-auto-scroll flex flex-col w-72">
        <div className="flex flex-row text-xl items-center font-black">
          <h1>innsight</h1>
          <button
            type="button"
            className="text-red-400 ml-auto"
            onClick={() => {
              localStorage.removeItem("innsight-token");
              router.push("/login");
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
        {status?.map((status) => (
          <ServerCard
            {...status}
            onClick={() => setSelected(status)}
            key={status.id}
          />
        ))}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {selected ? (
          <ServerContainer token={token} machine={selected} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
