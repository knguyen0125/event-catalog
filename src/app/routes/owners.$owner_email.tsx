import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import db from "~/db";
import Container from "~/components/Container";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Owners" }, { name: "description", content: "Owners" }];
};

export async function loader({ params }: LoaderArgs) {
  const owner = await db
    .from("owners")
    .select("*")
    .where({ email: params.owner_email })
    .first();

  if (!owner) {
    throw new Response("Not found", { status: 404 });
  }

  return json({
    owner,
  });
}

export default function Owner() {
  const data = useLoaderData<typeof loader>();

  return (
    <Container>
      <h1 className="text-4xl font-bold">{data.owner.name}</h1>
      <h2 className="text-2xl font-bold">{data.owner.role}</h2>
      <p>{data.owner.email}</p>
    </Container>
  );
}
