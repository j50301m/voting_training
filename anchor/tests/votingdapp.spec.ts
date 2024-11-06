import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Votingdapp } from '../target/types/votingdapp'
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';

const IDL = require("../target/idl/votingdapp.json");
const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('votingdapp', () => {
  it('Initialize Poll', async () => {
    const context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    )

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
})
