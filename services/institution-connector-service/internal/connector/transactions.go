package connector

import (
	"context"
	"fmt"
	"net/url"
	"strconv"
)

// TransactionFilter são filtros opcionais para ListTransactions.
type TransactionFilter struct {
	From     string // data ISO YYYY-MM-DD (opcional)
	To       string // data ISO YYYY-MM-DD (opcional)
	PageSize int    // padrão e máximo: 500
}

// ListTransactions percorre todas as páginas e retorna todas as transações da
// conta no período. A Pluggy pagina em até 500 itens por página.
func (c *Client) ListTransactions(ctx context.Context, accountID string, f TransactionFilter) ([]Transaction, error) {
	if accountID == "" {
		return nil, fmt.Errorf("accountId é obrigatório")
	}
	pageSize := f.PageSize
	if pageSize <= 0 || pageSize > 500 {
		pageSize = 500
	}

	var all []Transaction
	for page := 1; ; page++ {
		q := url.Values{}
		q.Set("accountId", accountID)
		q.Set("page", strconv.Itoa(page))
		q.Set("pageSize", strconv.Itoa(pageSize))
		if f.From != "" {
			q.Set("from", f.From)
		}
		if f.To != "" {
			q.Set("to", f.To)
		}

		var pg Paginated[Transaction]
		if err := c.get(ctx, pathTransactions, q, &pg); err != nil {
			return nil, err
		}
		all = append(all, pg.Results...)

		if len(pg.Results) == 0 || page >= pg.TotalPages {
			break
		}
	}
	return all, nil
}
