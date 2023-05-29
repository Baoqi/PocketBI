echo "build for mac amd64"
GOOS=darwin GOARCH=amd64  go build -o pocketbi main.go
zip -r pocketbi_mac_amd64.zip pocketbi pb_public/*
rm pocketbi

echo "build for mac arm64"
GOOS=darwin GOARCH=arm64  go build -o pocketbi main.go
zip -r pocketbi_mac_arm64.zip pocketbi pb_public/*
rm pocketbi

echo "build for linux amd64"
GOOS=linux GOARCH=amd64  go build -o pocketbi main.go
zip -r pocketbi_linux_amd64.zip pocketbi pb_public/*
rm pocketbi

echo "build for linux arm64"
GOOS=linux GOARCH=arm64  go build -o pocketbi main.go
zip -r pocketbi_linux_arm64.zip pocketbi pb_public/*
rm pocketbi

echo "build for windows amd64"
GOOS=windows GOARCH=amd64  go build -o pocketbi.exe main.go
zip -r pocketbi_windows_amd64.zip pocketbi.exe pb_public/*
rm pocketbi.exe
