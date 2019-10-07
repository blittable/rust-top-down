use std::fs;
use std::io;
use std::io::prelude::*;
use std::io::SeekFrom;

fn main() {
    let mut fp = fs::OpenOptions::new()
        .create(true)
        .write(true)
        .open("test.txt")
        .expect("cannot create file");
}
