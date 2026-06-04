package connector

import (
	"context"
	"net/url"
)

// ListInvestments lista as posições de investimento de um item.
func (c *Client) ListInvestments(ctx context.Context, itemID string) ([]Investment, error) {
	q := url.Values{}
	if itemID != "" {
		q.Set("itemId", itemID)
	}
	var env resultsEnvelope[Investment]
	if err := c.get(ctx, pathInvestments, q, &env); err != nil {
		return nil, err
	}
	return env.Results, nil
}
