package connector

import (
	"context"
	"net/url"
)

// GetIdentity recupera os dados cadastrais do titular de um item (escopo
// IDENTITY_READ). Retorna nil sem erro quando o provedor não traz identidade.
func (c *Client) GetIdentity(ctx context.Context, itemID string) (*Identity, error) {
	q := url.Values{}
	if itemID != "" {
		q.Set("itemId", itemID)
	}
	var id Identity
	if err := c.get(ctx, pathIdentity, q, &id); err != nil {
		return nil, err
	}
	if id.ID == "" && id.FullName == "" {
		return nil, nil
	}
	return &id, nil
}
