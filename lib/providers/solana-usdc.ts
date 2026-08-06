import { Connection, PublicKey } from "@solana/web3.js";

const RPC_ENDPOINT = process.env.SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
const VANTYX_WALLET = process.env.SOLANA_VAULT_PUBLIC_KEY || "";

const connection = new Connection(RPC_ENDPOINT);

export interface SolanaUSDCPaymentInput {
  tenantId: string;
  customerId: string;
  customerWallet: string;
  amountUSDC: number;
  description?: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface SolanaUSDCPaymentResult {
  success: boolean;
  transactionId: string;
  status: "confirmed" | "pending" | "failed";
  amount: number;
  error?: string;
}

export async function initiateSolanaUSDCPayment(
  input: SolanaUSDCPaymentInput
): Promise<SolanaUSDCPaymentResult> {
  try {
    if (!VANTYX_WALLET) {
      throw new Error("SOLANA_VAULT_PUBLIC_KEY not configured");
    }

    // Verify wallet addresses are valid
    try {
      new PublicKey(input.customerWallet);
      new PublicKey(VANTYX_WALLET);
    } catch {
      throw new Error("Invalid wallet address");
    }

    // In production, this would:
    // 1. Create a transfer instruction from customer -> Vantyx vault
    // 2. Sign with customer's private key (obtained via wallet adapter)
    // 3. Send transaction to network
    // 4. Confirm and track on-chain

    // For now, return pending result
    const transactionId = generateSolanaTransactionId();

    return {
      success: true,
      transactionId,
      status: "pending",
      amount: input.amountUSDC,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Solana payment initiation failed";
    return {
      success: false,
      transactionId: "",
      status: "failed",
      amount: input.amountUSDC,
      error: message,
    };
  }
}

export async function getSolanaTransactionStatus(
  transactionId: string
): Promise<SolanaUSDCPaymentResult> {
  try {
    const tx = await connection.getSignatureStatus(transactionId);

    if (!tx.value) {
      throw new Error("Transaction not found");
    }

    const status = tx.value.confirmationStatus === "finalized" ? "confirmed" : "pending";
    const success = tx.value.err === null;

    return {
      success,
      transactionId,
      status,
      amount: 0, // Would fetch from on-chain data
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transaction status check failed";
    return {
      success: false,
      transactionId,
      status: "failed",
      amount: 0,
      error: message,
    };
  }
}

export async function verifySolanaUSDCPayment(
  transactionId: string,
  expectedAmountUSDC: number,
  expectedDestination: string
): Promise<boolean> {
  try {
    const tx = await connection.getParsedTransaction(transactionId);

    if (!tx || tx.meta?.err !== null) {
      return false;
    }

    // Verify transaction contains USDC transfer to expected destination
    const instructions = tx.transaction.message.instructions;

    for (const instruction of instructions) {
      if ("program" in instruction && instruction.program === "spl-token") {
        const data = instruction as any;
        if (data.parsed?.type === "transfer") {
          const destination = data.parsed.info.destination;
          const amount = data.parsed.info.tokenAmount?.uiAmount;

          if (destination === expectedDestination && amount === expectedAmountUSDC) {
            return true;
          }
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

function generateSolanaTransactionId(): string {
  // In production, this would be an actual Solana transaction signature
  return "mock_" + Math.random().toString(36).substring(2, 15);
}
