import { BN, Program } from "@coral-xyz/anchor";
import { ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { ActionGetResponse, ActionPostRequest } from "@solana/actions-spec"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp";
const IDL = require('@/../anchor/target/idl/votingdapp.json');

export const OPTIONS = GET;


export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://uploads.dailydot.com/2018/10/olli-the-polite-cat.jpg?q=65&auto=format&w=1600&ar=2:1&fit=crop",
    title: "Vote for your favorite programming language",
    description: "Vote for your favorite programming language",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for Rust",
          href: "/api/vote?candidate=Rust",
          type: "post"
        },
        {
          label: "Vote for Javascript",
          href: "/api/vote?candidate=Javascript",
          type: "post"
        }
      ]
    }
  }
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate !== "Rust" && candidate !== "Javascript") {
    return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Votingdapp> = new Program(IDL, { connection });
  const body: ActionPostRequest = await request.json();

  let voter;
  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction();

    const blockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({
      feePayer: voter,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      })
      .add(instruction);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction
    }
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
