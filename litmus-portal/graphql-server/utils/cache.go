package utils

import (
	"github.com/patrickmn/go-cache"

	"time"
)

const (
	cacheExpiration = time.Second * 15
	cleanupInterval = time.Second * 15
)

// AddCache function takes a string and an object to be cached
func AddCache(c *cache.Cache, k string, x interface{}) error {
	return c.Add(k, x, cacheExpiration)
}

// UpdateCache function takes a string and an object to be cached
func UpdateCache(c *cache.Cache, k string, x interface{}) error {
	return c.Replace(k, x, cacheExpiration)
}

// NewCache initializes a new cache with a given expiration period and cleanup interval
func NewCache() *cache.Cache {
	return cache.New(cacheExpiration, cleanupInterval)
}
