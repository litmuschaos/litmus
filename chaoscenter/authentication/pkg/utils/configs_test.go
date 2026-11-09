package utils

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetEnvAsInt(t *testing.T) {
	testKey := "TEST_ENV_INT_VAL"
	defer os.Unsetenv(testKey)

	t.Run("returns default value when env is unset", func(t *testing.T) {
		os.Unsetenv(testKey)
		val := getEnvAsInt(testKey, 42)
		assert.Equal(t, 42, val)
	})

	t.Run("returns parsed int when env is valid integer", func(t *testing.T) {
		os.Setenv(testKey, "100")
		val := getEnvAsInt(testKey, 42)
		assert.Equal(t, 100, val)
	})

	t.Run("returns default value when env is non-integer string", func(t *testing.T) {
		os.Setenv(testKey, "not-an-int")
		val := getEnvAsInt(testKey, 42)
		assert.Equal(t, 42, val)
	})
}

func TestGetEnvAsBool(t *testing.T) {
	testKey := "TEST_ENV_BOOL_VAL"
	defer os.Unsetenv(testKey)

	t.Run("returns default value when env is unset", func(t *testing.T) {
		os.Unsetenv(testKey)
		val := getEnvAsBool(testKey, true)
		assert.True(t, val)

		valFalse := getEnvAsBool(testKey, false)
		assert.False(t, valFalse)
	})

	t.Run("returns parsed bool when env is true or 1", func(t *testing.T) {
		os.Setenv(testKey, "true")
		assert.True(t, getEnvAsBool(testKey, false))

		os.Setenv(testKey, "1")
		assert.True(t, getEnvAsBool(testKey, false))
	})

	t.Run("returns parsed bool when env is false or 0", func(t *testing.T) {
		os.Setenv(testKey, "false")
		assert.False(t, getEnvAsBool(testKey, true))

		os.Setenv(testKey, "0")
		assert.False(t, getEnvAsBool(testKey, true))
	})

	t.Run("returns default value when env is invalid boolean string", func(t *testing.T) {
		os.Setenv(testKey, "invalid-bool")
		assert.True(t, getEnvAsBool(testKey, true))
		assert.False(t, getEnvAsBool(testKey, false))
	})
}
