SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;


CREATE INDEX idx_customer ON customer (c_w_id,c_d_id,c_last,c_first);
CREATE INDEX idx_orders ON orders (o_w_id,o_d_id,o_c_id,o_id);
CREATE INDEX fkey_stock_2 ON stock (s_i_id);
CREATE INDEX fkey_order_line_2 ON order_line (ol_supply_w_id,ol_i_id);

ALTER TABLE district  ADD CONSTRAINT fkey_district_1 FOREIGN KEY(d_w_id) REFERENCES warehouse(w_id);
ALTER TABLE customer ADD CONSTRAINT fkey_customer_1 FOREIGN KEY(c_w_id,c_d_id) REFERENCES district(d_w_id,d_id);
ALTER TABLE history  ADD CONSTRAINT fkey_history_1 FOREIGN KEY(h_c_w_id,h_c_d_id,h_c_id) REFERENCES customer(c_w_id,c_d_id,c_id);
ALTER TABLE history  ADD CONSTRAINT fkey_history_2 FOREIGN KEY(h_w_id,h_d_id) REFERENCES district(d_w_id,d_id);
ALTER TABLE new_orders ADD CONSTRAINT fkey_new_orders_1 FOREIGN KEY(no_w_id,no_d_id,no_o_id) REFERENCES orders(o_w_id,o_d_id,o_id);
ALTER TABLE orders ADD CONSTRAINT fkey_orders_1 FOREIGN KEY(o_w_id,o_d_id,o_c_id) REFERENCES customer(c_w_id,c_d_id,c_id);
ALTER TABLE order_line ADD CONSTRAINT fkey_order_line_1 FOREIGN KEY(ol_w_id,ol_d_id,ol_o_id) REFERENCES orders(o_w_id,o_d_id,o_id);
ALTER TABLE order_line ADD CONSTRAINT fkey_order_line_2 FOREIGN KEY(ol_supply_w_id,ol_i_id) REFERENCES stock(s_w_id,s_i_id);
ALTER TABLE stock ADD CONSTRAINT fkey_stock_1 FOREIGN KEY(s_w_id) REFERENCES warehouse(w_id);
ALTER TABLE stock ADD CONSTRAINT fkey_stock_2 FOREIGN KEY(s_i_id) REFERENCES item(i_id);



SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
