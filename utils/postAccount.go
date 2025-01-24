package utils

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

func PostAccount(address, email, name string) error {
	godotenv.Load("../../../../.env")

	preapproved := strings.Split(os.Getenv("PRE_APPROVED_ADMINS"), ",")

	auth_level := "none"
	for _, a := range preapproved {
		if a == email {
			auth_level = "admin"
		}
	}

	body := bytes.NewReader([]byte(fmt.Sprintf(`{
		"records": [
			{
				"fields": {
					"address": "%s",
					"email": "%s",
					"name": "%s",
					"auth_level": "%s"
				}
			}
		]
	}`, address, email, name, auth_level)))

	url := fmt.Sprintf("https://api.airtable.com/v0/%s/%s",
		os.Getenv("AIRTABLE_BASE_ID"), os.Getenv("AIRTABLE_AUTH_TABLE_ID"))

	req, err := http.NewRequest(http.MethodPost, url, body)

	if err != nil {
		err = fmt.Errorf("error creating post account request: %s", err)
		return err
	}

	key := os.Getenv("AIRTABLE_KEY")

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", key))

	client := http.Client{
		Timeout: time.Second * 10,
	}

	res, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("error sending post account request: %s", err)
		return err
	}

	_, err = io.ReadAll(res.Body)
	if err != nil {
		err = fmt.Errorf("error sending post account request: %s", err)
		return err
	}

	return nil
}
