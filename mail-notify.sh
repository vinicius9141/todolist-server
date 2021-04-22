#!/bin/bash

curl -H "Content-type: application/json" -d '{
	"secret": "1905994d4216d9028caa4a4899f454d8"
}' 'http://localhost:3000/test-deadline-notification' -v


