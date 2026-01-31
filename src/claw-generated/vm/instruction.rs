#[derive(Debug, PartialEq, Eq)]
pub enum Instruction {
    // Stack operations
    Push(u64),
    Pop,
    Dup(usize),
    Swap(usize),

    // Arithmetic
    Add,
    Sub,
    Mul,
    Div,
    Mod,

    // Logical
    And,
    Or,
    Xor,
    Not,

    // Flow control
    Jump(usize),
    JumpI(usize),
    Return,

    // Contract-specific
    CreateContract,
    CallContract,
    DestroyContract,
}