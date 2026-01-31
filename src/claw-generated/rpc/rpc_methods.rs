use crate::vm::VM;
use crate::transaction::Transaction;

pub fn simulate_transaction(tx: Transaction) -> (Vec<String>, u64) {
    let mut vm = VM::new();
    vm.execute_transaction(tx);
    (vm.logs, vm.compute_units_used)
}