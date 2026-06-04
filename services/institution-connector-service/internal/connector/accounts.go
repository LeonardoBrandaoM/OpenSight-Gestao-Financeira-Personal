package connector

import (
	"context"
	"fmt"
	"net/url"
)

// ListAccounts lista as contas de um item (conexão). Se itemID for vazio, a
// Pluggy exige o filtro — passe sempre o itemId em uso normal.
func (c *Client) ListAccounts(ctx context.Context, itemID string) ([]Account, error) {
	q := url.Values{}
	if itemID != "" {
		q.Set("itemId", itemID)
	}
	var env resultsEnvelope[Account]
	if err := c.get(ctx, pathAccounts, q, &env); err != nil {
		return nil, err
	}
	return env.Results, nil
}

// GetAccount recupera uma conta pelo id.
func (c *Client) GetAccount(ctx context.Context, id string) (*Account, error) {
	if id == "" {
		return nil, fmt.Errorf("id da conta é obrigatório")
	}
	var a Account
	if err := c.get(ctx, pathAccounts+"/"+url.PathEscape(id), nil, &a); err != nil {
		return nil, err
	}
	return &a, nil
}
