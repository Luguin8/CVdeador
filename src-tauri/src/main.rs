// Evita que se abra una consola extra en Windows al ejecutar el .exe
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Aquí llamamos a la función run() que armamos en lib.rs
    ats_optimizer_lib::run();
}
