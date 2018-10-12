package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"syscall"
	"testing"
)

var (
	eventsDLLPath = "./dll/events.dll"
)

// func TestMain(m *testing.M) {
// 	defer syscall.FreeLibrary(kernel32)
// 	defer syscall.FreeLibrary(eventsDLL)
// }

func Test_DLL(t *testing.T) {
	file, err := os.Open(eventsDLLPath)
	defer file.Close()
	ok(t, err)
}

func Test_PrintBye(t *testing.T) {
	expected := "From DLL: Bye!"
	actual := getPrintBye()

	assert(
		t,
		actual == expected,
		fmt.Sprintf(
			"[FAIL] PrintBye: [expected]: %s [actual]: %s",
			expected,
			actual,
		),
	)
}

func getPrintBye() string {
	// var nargs uintptr
	// ret, _, callErr := syscall.Syscall(uintptr(printBye), nargs, 0, 0, 0)

	// t.Logf("ret: %+v", ret)
	// t.Logf("callErr: %+v", callErr)

	// if callErr != 0 {
	// 	// abort("Call PrintBye", callErr)
	// 	return ""
	// } else {
	// 	result = string(ret)
	// }
	// return

	var mod = syscall.NewLazyDLL(eventsDLLPath)
	var proc = mod.NewProc("PrintBye")

	ret, _, _ := proc.Call()

	return string(ret)
}

func abort(funcname string, err error) {
	panic(fmt.Sprintf("%s failed: %v", funcname, err))
}

// func getModuleHandle() (handle uintptr) {
// 	var nargs uintptr
// 	if ret, _, callErr := syscall.Syscall(uintptr(moduleHandle), nargs, 0, 0, 0); callErr != 0 {
// 		abort("Call GetModuleHandle", callErr)
// 	} else {
// 		handle = ret
// 	}
// 	return
// }

// assert fails the test if the condition is false.
func assert(t *testing.T, condition bool, msg string, v ...interface{}) {
	if !condition {
		_, file, line, _ := runtime.Caller(1)
		fmt.Printf("\033[31m%s:%d: "+msg+"\033[39m\n\n", append([]interface{}{filepath.Base(file), line}, v...)...)
		t.FailNow()
	}
}

// ok fails the test if an err is not nil.
func ok(t *testing.T, err error) {
	if err != nil {
		_, file, line, _ := runtime.Caller(1)
		fmt.Printf("\033[31m%s:%d: unexpected error: %s\033[39m\n\n", filepath.Base(file), line, err.Error())
		t.FailNow()
	}
}
