package main

import (
	"C"
	"fmt"
)

//export PrintBye
func PrintBye() {
	fmt.Println("From DLL: Bye!")
}

func main() {}
