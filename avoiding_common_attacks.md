# Avoiding Common Attacks

## SWC-103 Compiler Pragma
The contract is set to `0.8.0`.

## Modifiers only validate
The modifiers in the contract are only used for sender/parameter validation.

## SWC-115 tx.origin auth
The contract only uses `msg.sender` for creator/owner verification.
