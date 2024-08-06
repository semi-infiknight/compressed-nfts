/*
  This script demonstrates how to mint an additional compressed NFT to an existing tree and/or collection
  ---
  NOTE: A collection can use multiple trees to store compressed NFTs, as desired. 
  This example uses the same tree for simplicity.
*/

import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";

// import custom helpers to mint compressed NFTs
import { WrapperConnection } from "@/ReadApi/WrapperConnection";
import { mintCompressedNFT } from "@/utils/compression";
import {
  loadKeypairFromFile,
  loadOrGenerateKeypair,
  loadPublicKeysFromFile,
  printConsoleSeparator,
} from "@/utils/helpers";

// load the env variables and store the cluster RPC url
import dotenv from "dotenv";
dotenv.config();

(async () => {
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // generate a new Keypair for testing, named `wallet`
  const testWallet = loadOrGenerateKeypair("testWallet");

  // generate a new keypair for use in this demo (or load it locally from the filesystem when available)
  const payer = process.env?.LOCAL_PAYER_JSON_ABSPATH
    ? loadKeypairFromFile(process.env?.LOCAL_PAYER_JSON_ABSPATH)
    : loadOrGenerateKeypair("payer");

  console.log("Payer address:", payer.publicKey.toBase58());
  console.log("Test wallet address:", testWallet.publicKey.toBase58());

  // load the stored PublicKeys for ease of use
  let keys = loadPublicKeysFromFile();

  // ensure the primary script was already run
  if (!keys?.collectionMint || !keys?.treeAddress)
    return console.warn("No local keys were found. Please run the `index` script");


  // const treeAddress: PublicKey = keys.treeAddress;
  // const treeAuthority: PublicKey = keys.treeAuthority;
  // const collectionMint: PublicKey = keys.collectionMint;
  // const collectionMetadataAccount: PublicKey = keys.collectionMetadataAccount;
  // const collectionMasterEditionAccount: PublicKey = keys.collectionMasterEditionAccount;

  const treeAddress: PublicKey = new PublicKey(process.env.TREE_ADDRESS as string);
  const treeAuthority: PublicKey = new PublicKey(process.env.TREE_AUTHORITY as string);
  const collectionMint: PublicKey =new PublicKey(process.env.COLLECTION_MINT as string);
  const collectionMetadataAccount: PublicKey = new PublicKey(process.env.COLLECTION_METADATA as string);
  const collectionMasterEditionAccount: PublicKey = new PublicKey(process.env.COLLECTION_MASTER_EDITION as string);

  

  console.log("==== Local PublicKeys loaded ====");
  console.log("Tree address:", treeAddress);
  console.log("Tree authority:", treeAuthority);
  console.log("Collection mint:", collectionMint);
  console.log("Collection metadata:", collectionMetadataAccount);
  console.log("Collection master edition:", collectionMasterEditionAccount);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // load the env variables and store the cluster RPC url
  const CLUSTER_URL = process.env.RPC_URL ?? clusterApiUrl("devnet");

  // create a new rpc connection, using the ReadApi wrapper
  const connection = new WrapperConnection(CLUSTER_URL);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  printConsoleSeparator();

  /*
    Mint a single compressed NFT
  */

  const compressedNFTMetadata: MetadataArgs = {
    name: "NFT Send Game",
    symbol: "SSNC",
    // specific json metadata for each NFT
    uri: "https://backscattering.de/web-boardimage/board.svg?fen=rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR%20b%20-%20-%200%201&lastMove=g1h3&arrows=g1h3",
    sellerFeeBasisPoints: 100,
    creators: [
      {
        address: payer.publicKey,
        verified: false,
        share: 99,
        // share: 100,
      },
      {
        address: testWallet.publicKey,
        verified: false,
        share: 1,
        // share: 0,
      },
    ],
    editionNonce: 0,
    uses: null,
    collection: null,
    primarySaleHappened: false,
    isMutable: true,
    // values taken from the Bubblegum package
    tokenProgramVersion: TokenProgramVersion.Original,
    tokenStandard: TokenStandard.NonFungible,
  };

  // fully mint a single compressed NFT
  console.log(`Minting a single compressed NFT to ${payer.publicKey.toBase58()}...`);

  const mintToWallet = await mintCompressedNFT(
    connection,
    payer,
    treeAddress,
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
    compressedNFTMetadata,
    // mint to this specific wallet (in this case, airdrop to `testWallet`)
    payer.publicKey,
  );
})();
