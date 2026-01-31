use std::collections::VecDeque;

use crate::types::{Transaction, TransactionReceipt};
use crate::vm::instruction::Instruction;

pub struct VirtualMachine {
    stack: VecDeque<u64>,
    program_counter: usize,
    memory: Vec<u8>,
    gas_limit: u64,
    gas_used: u64,
}

impl VirtualMachine {
    pub fn new(gas_limit: u64) -> Self {
        VirtualMachine {
            stack: VecDeque::new(),
            program_counter: 0,
            memory: Vec::new(),
            gas_limit,
            gas_used: 0,
        }
    }

    pub fn execute_transaction(tx: Transaction) -> TransactionReceipt {
        let mut vm = VirtualMachine::new(tx.gas_limit);
        let bytecode = tx.contract_bytecode;

        while vm.program_counter < bytecode.len() {
            let instruction = decode_instruction(&bytecode, vm.program_counter);
            vm.execute_instruction(instruction);
            vm.program_counter += 1;
        }

        TransactionReceipt {
            logs: vec![],
            compute_units_consumed: vm.gas_used,
        }
    }

    fn execute_instruction(&mut self, instruction: Instruction) {
        match instruction {
            Instruction::Push(value) => self.stack.push_back(value),
            Instruction::Pop => {
                self.stack.pop_back();
                self.gas_used += 1;
            }
            Instruction::Dup(index) => {
                let value = self.stack.get(index).unwrap().to_owned();
                self.stack.push_back(value);
                self.gas_used += 1;
            }
            Instruction::Swap(index) => {
                let last = self.stack.pop_back().unwrap();
                let swap = self.stack.get_mut(index).unwrap();
                let temp = *swap;
                *swap = last;
                self.stack.push_back(temp);
                self.gas_used += 1;
            }
            // Implement other instructions
            _ => unimplemented!(),
        }
    }
}

fn decode_instruction(bytecode: &[u8], pc: usize) -> Instruction {
    // Implement instruction decoding logic
    Instruction::Push(0)
}