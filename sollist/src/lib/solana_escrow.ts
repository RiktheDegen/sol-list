/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_escrow.json`.
 */
export type SolanaEscrow = {
  address: "9mGNkzxnW6u9exXGEy4Y68xZWmJsMgkMCXRagnjmMDRu";
  metadata: {
    name: "solanaEscrow";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "buyerConfirm";
      discriminator: [99, 179, 213, 25, 73, 74, 68, 217];
      accounts: [
        {
          name: "buyer";
          writable: true;
          signer: true;
          relations: ["escrow"];
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "escrow.seller";
                account: "escrow";
              },
              {
                kind: "account";
                path: "escrow.id";
                account: "escrow";
              }
            ];
          };
        }
      ];
      args: [];
    },
    {
      name: "create";
      discriminator: [24, 30, 200, 40, 5, 28, 7, 119];
      accounts: [
        {
          name: "seller";
          writable: true;
          signer: true;
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "arg";
                path: "id";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        },
        {
          name: "params";
          type: {
            defined: {
              name: "createParams";
            };
          };
        }
      ];
    },
    {
      name: "fund";
      discriminator: [218, 188, 111, 221, 152, 113, 174, 7];
      accounts: [
        {
          name: "buyer";
          writable: true;
          signer: true;
          relations: ["escrow"];
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "escrow.seller";
                account: "escrow";
              },
              {
                kind: "account";
                path: "escrow.id";
                account: "escrow";
              }
            ];
          };
        },
        {
          name: "tokenMint";
        },
        {
          name: "buyerTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "buyer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "escrow";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "termsUpdateSlot";
          type: "u64";
        }
      ];
    },
    {
      name: "markShipped";
      discriminator: [239, 5, 66, 105, 238, 17, 89, 97];
      accounts: [
        {
          name: "seller";
          writable: true;
          signer: true;
          relations: ["escrow"];
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "escrow.seller";
                account: "escrow";
              },
              {
                kind: "account";
                path: "escrow.id";
                account: "escrow";
              }
            ];
          };
        }
      ];
      args: [];
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: "seller";
          writable: true;
          signer: true;
          relations: ["escrow"];
        },
        {
          name: "escrow";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                kind: "account";
                path: "escrow.seller";
                account: "escrow";
              },
              {
                kind: "account";
                path: "escrow.id";
                account: "escrow";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "escrow";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "sellerTokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "seller";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMint";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "tokenMint";
          relations: ["escrow"];
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "escrow";
      discriminator: [31, 213, 123, 187, 186, 22, 218, 155];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "invalidAmount";
      msg: "Invalid amount";
    },
    {
      code: 6001;
      name: "buyerCannotBeSeller";
      msg: "Buyer cannot be the seller";
    },
    {
      code: 6002;
      name: "invalidBuyerAddress";
      msg: "Invalid buyer address";
    },
    {
      code: 6003;
      name: "invalidArbiterAddress";
      msg: "Invalid arbiter address";
    },
    {
      code: 6004;
      name: "invalidBuyer";
      msg: "Invalid buyer";
    },
    {
      code: 6005;
      name: "invalidEscrowState";
      msg: "Invalid escrow state";
    },
    {
      code: 6006;
      name: "invalidTokenMint";
      msg: "Invalid token mint";
    },
    {
      code: 6007;
      name: "termsChanged";
      msg: "Terms have changed";
    },
    {
      code: 6008;
      name: "insufficientFunds";
      msg: "Insufficient funds";
    },
    {
      code: 6009;
      name: "invalidSeller";
      msg: "Invalid seller";
    },
    {
      code: 6010;
      name: "escrowNotShipped";
      msg: "Escrow not shipped";
    },
    {
      code: 6011;
      name: "withdrawTooEarly";
      msg: "Withdraw too early";
    },
    {
      code: 6012;
      name: "invalidDuration";
      msg: "Invalid duration";
    },
    {
      code: 6013;
      name: "invalidVaultBalance";
      msg: "Invalid vault balance";
    }
  ];
  types: [
    {
      name: "createParams";
      docs: ["Parameters for creating an escrow"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "buyer";
            type: "pubkey";
          },
          {
            name: "arbiter";
            type: "pubkey";
          },
          {
            name: "tokenMint";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "autoCompleteDuration";
            type: "i64";
          }
        ];
      };
    },
    {
      name: "escrow";
      docs: ["Escrow account structure"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "version";
            docs: ["Version for potential upgrades"];
            type: "u8";
          },
          {
            name: "state";
            type: {
              defined: {
                name: "escrowState";
              };
            };
          },
          {
            name: "id";
            docs: ["id and seller are seeds for PDA"];
            type: "u64";
          },
          {
            name: "seller";
            type: "pubkey";
          },
          {
            name: "buyer";
            type: "pubkey";
          },
          {
            name: "arbiter";
            type: "pubkey";
          },
          {
            name: "tokenMint";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "autoCompleteDuration";
            docs: [
              "Duration (in seconds) after shipping before seller can mark as completed if not disputed"
            ];
            type: "i64";
          },
          {
            name: "termsUpdateSlot";
            docs: ["Slot at which the escrow terms were last updated"];
            type: "u64";
          },
          {
            name: "markedShippedAt";
            docs: [
              "Unix timestamp when the item was marked as shipped (None if not shipped)"
            ];
            type: {
              option: "i64";
            };
          },
          {
            name: "bump";
            docs: ["PDA bump"];
            type: "u8";
          }
        ];
      };
    },
    {
      name: "escrowState";
      docs: ["Represents the current state of the escrow"];
      type: {
        kind: "enum";
        variants: [
          {
            name: "created";
          },
          {
            name: "funded";
          },
          {
            name: "markedAsShipped";
          },
          {
            name: "buyerConfirmed";
          },
          {
            name: "fundsReleased";
          },
          {
            name: "cancelled";
          }
        ];
      };
    }
  ];
};
