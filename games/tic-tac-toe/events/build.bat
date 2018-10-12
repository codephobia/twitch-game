go build -o ./dll/dll.a -buildmode=c-archive main.go
gcc -shared -pthread -o ./dll/events.dll ./dll/dll.c ./dll/dll.a -lWinMM -lntdll -lWS2_32