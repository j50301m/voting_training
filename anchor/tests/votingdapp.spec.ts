import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Votingdapp } from '../target/types/votingdapp'
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';
import { atomWithDefault } from 'jotai/utils';
import exp from 'constants';

const IDL = require("../target/idl/votingdapp.json");
const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('votingdapp', () => {

  let context;
  let provider;
  let votingProgram: anchor.Program<Votingdapp>;

  beforeAll(async () => {
    context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);
    provider = new BankrunProvider(context);

    votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    )
  })


  it('Initialize Poll', async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "whait is your favorite programming language?",
      new anchor.BN(0),
      new anchor.BN(1830877602),
    ).rpc();


    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.description).toBe("whait is your favorite programming language?");
    expect(poll.pollStart.toNumber()).toBe(0);
    expect(poll.pollEnd.toNumber()).toBe(1830877602);
  });

  it("initialize candidate", async () => {
    await votingProgram.methods.initializeCandidate(
      "Rust",
      new anchor.BN(1),
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Javascript",
      new anchor.BN(1),
    ).rpc();

    // Fetch candidate
    const [candidateAddress1] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Rust")],
      votingAddress,
    );

    const [candidateAddress2] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Javascript")],
      votingAddress,
    );
    const candidate1 = await votingProgram.account.candidate.fetch(candidateAddress1);
    const candidate2 = await votingProgram.account.candidate.fetch(candidateAddress2);

    // Validate candidate properties
    console.log(candidate1);
    console.log(candidate2);

    expect(candidate1.candidateName).toEqual("Rust");
    expect(candidate1.candidateVotes.toNumber()).toEqual(0);
    expect(candidate2.candidateName).toEqual("Javascript");
    expect(candidate2.candidateVotes.toNumber()).toEqual(0);
  });

  it("vote", async () => {
    await votingProgram.methods.vote(
      "Rust",
      new anchor.BN(1),
    ).rpc();

    // Fetch candidate
    const [candidateAddress1] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Rust")],
      votingAddress,
    );
    const candidate1 = await votingProgram.account.candidate.fetch(candidateAddress1);
    console.log(candidate1);

    expect(candidate1.candidateVotes.toNumber()).toEqual(1);

  });
})
