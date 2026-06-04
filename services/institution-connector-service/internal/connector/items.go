package connector

import (
	"context"
	"fmt"
	"net/url"
)

// GetItem recupera o status/metadados de uma conexão (item) pelo id.
func (c *Client) GetItem(ctx context.Context, id string) (*Item, error) {
	if id == "" {
		return nil, fmt.Errorf("id do item é obrigatório")
	}
	var it Item
	if err := c.get(ctx, pathItems+"/"+url.PathEscape(id), nil, &it); err != nil {
		return nil, err
	}
	return &it, nil
}
