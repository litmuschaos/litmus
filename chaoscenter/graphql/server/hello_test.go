func TestHelloWorld(t *testing.T) {
    t.Run("success", func(t *testing.T) {
        // Simulate a successful case
        result := "Hello, World!"
        if result != "Hello, World!" {
            t.Errorf("expected %s, got %s", "Hello, World!", result)
        }
    })

    t.Run("failure", func(t *testing.T) {
        // Simulate a failure case
        result := "Goodbye, World!"
        if result == "Hello, World!" {
            t.Errorf("expected not %s, got %s", "Hello, World!", result)
        }
    })
}