# Solana Token Creator

## Creating a Solana Token

[Demo](https://token-creator-lac.vercel.app/)

You can use the token creator application to create a token and
sent it to your wallet. This application is purely for demonstration
purposes.

## Full Breakdown

Creating a Solana token requires the following steps:

1. Creating a new Mint account
2. Creating an associated token account
3. Minting an amount of the token to the associated token account
4. Adding the token metadata to the mint account

### Creating a new mint account

Mint accounts hold information about the token such as how 
many decimals the token has and who can mint new tokens.

You can create a custom keypair for the mint account by
[grinding a keypair](https://solanacookbook.com/references/keypairs-and-wallets.html#how-to-generate-a-vanity-address). 
This keypair's public key will be used to have a vanity address 
for the token. Create a new mint account with that key
by first initializing the account and space for the mint 
account, then calling `createInitializeMintInstruction`. 
These instructions can be added and executed in the same 
transaction.

```typescript
const Transaction = new Transaction().add(
  SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: lamports,
      programId: TOKEN_PROGRAM_ID,
  }),
  createInitializeMintInstruction(
    mintKeypair.publicKey, 
    form.decimals, 
    publicKey, 
    publicKey, 
    TOKEN_PROGRAM_ID)
);
```

### Creating an Associated Token Account

Associated Token Accounts are derived from the mint account's
address. They hold the token's balance and can be used to transfer
tokens from one wallet to another.

Normally when getting ATA's for a user, you would use
`getOrCreateAssociatedTokenAccount`. This function will create the
ATA if it doesn't exist.

In our case, we created a brand new mint account and know the ATA will
not exist. So we can make a transaction with the 
`createAssociatedTokenAccountInstruction`, getting the derived address
with `getAssociatedTokenAddress`.

```typescript
const Transaction = new Transaction().add(
  createAssociatedTokenAccountInstruction(
    publicKey,
    tokenATA,
    publicKey,
    mintKeypair.publicKey,
  )
);
```

### Minting Tokens

When you mint tokens, you increase the overall supply of the token.
You can mint tokens by using `createMintToInstruction` in a transaction.

```typescript
const Transaction = new Transaction().add(
  createMintToInstruction(
    mintKeypair.publicKey,
    tokenATA,
    publicKey,
    form.amount
  )
);
```

### Adding the Token Metadata

When you create a token, you want to make sure that the token shows up
in user's wallets with a name, ticker, and image. Solana uses the [Token
Metadata Program from Metaplex](https://docs.metaplex.com/token-metadata/specification#token-standards) to achieve this.

The metadata account address is derived from the mint account. The metadata
field requires a JSON file to be populated with at least the following:

```json
{
  "name": "Coin name",
  "symbol": "Symbol",
  "image": "Image link"
}
```

You can find an example [here](https://token-creator-lac.vercel.app/token_metadata.json).

To attach the metadata to the mint account, you can use `CreateMetadataV2`.

```typescript
const createMetadataTransaction = new CreateMetadataV2(
  { feePayer: publicKey },
  {
    metadata: metadataPDA,
    metadataData: tokenMetadata,
    updateAuthority: publicKey,
    mint: mintKeypair.publicKey,
    mintAuthority: publicKey,
  },
)
```

`tokenMetadata` is the JSON file you want to attach to the mint account.
Some people use Arweave to host their metadata. You can also use any other
online storage solution.

### All Done!

Following all of the steps above, you should now have a token minted.

The best part is that you can actually add all of these instructions
to a single transaction:

```typescript
const createMintTransaction = new Transaction().add(
  SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: lamports,
      programId: TOKEN_PROGRAM_ID,
  }),
  createInitializeMintInstruction(
    mintKeypair.publicKey, 
    form.decimals, 
    publicKey, 
    publicKey, 
    TOKEN_PROGRAM_ID),
  createAssociatedTokenAccountInstruction(
    publicKey,
    tokenATA,
    publicKey,
    mintKeypair.publicKey,
  ),
  createMintToInstruction(
    mintKeypair.publicKey,
    tokenATA,
    publicKey,
    form.amount
  )
);
```
You can find the full source code for this application [here](https://github.com/jacobcreech/Token-Creator/blob/master/src/components/CreateToken.tsx).

Enjoy your new token!
