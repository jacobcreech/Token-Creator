import { FC, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const CreateAccountError: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = useCallback(async () => {
    const tempTokenAccount = Keypair.generate();
    let transaction = new Transaction();


    // Create Temp Token X Account
    transaction.add(
      SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        fromPubkey: publicKey,
        newAccountPubkey: tempTokenAccount.publicKey,
        space: AccountLayout.span,
        lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span )
      })
    );

    const signature  = await sendTransaction(transaction, connection);
    let txid = await connection.confirmTransaction(signature);
    console.log(txid);
  }, [publicKey, connection, sendTransaction]);

  return (
    <div>
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={onClick}
        >
          <span>Create Error</span>
        </button>
    </div>
  )
}