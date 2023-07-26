import type { V2_MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import Container from "~/components/Container";
import db from "~/db";
import type { Owner } from "../../types";
import Avatar from "~/components/Avatar";
import OwnerCard from "~/components/OwnerCard";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Owners" }, { name: "description", content: "Owners" }];
};

export async function loader() {
  const owners: Owner[] = await db.from("owners").select("*");

  return json({
    owners,
  });
}

export default function OwnersIndex() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container>
      <h1 className="py-4 text-4xl font-bold">Owners</h1>
      <ul>
        {data.owners.map((owner) => (
          <li key={owner.email}>
            <OwnerCard owner={owner} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
