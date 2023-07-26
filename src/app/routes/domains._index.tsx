import type { V2_MetaFunction } from "@remix-run/node";
import Container from "~/components/Container";
import db from "~/db";
import { json } from "@remix-run/node";
import { Domain } from "../../types";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Domains" }, { name: "description", content: "Domains" }];
};

export async function loader() {
  const domains: Domain[] = await db.from("domains").select("*");

  return json({
    domains,
  });
}

export default function DomainIndex() {
  return (
    <Container>
      <h1>Domains</h1>
    </Container>
  );
}
