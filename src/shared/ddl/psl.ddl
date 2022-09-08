CREATE TABLE psl
(
    site    INT NOT NULL
        CONSTRAINT psl_pk
            PRIMARY KEY,
    err     TEXT    DEFAULT NULL,
    psl0    jsonb   DEFAULT NULL,
    psl1    jsonb   DEFAULT NULL,
    idna    TEXT    DEFAULT NULL,
    sub_dom TEXT    DEFAULT NULL,
    reg_dom TEXT    DEFAULT NULL,
    top_dom TEXT    DEFAULT NULL,
    is_ip   BOOLEAN DEFAULT NULL,
    is_priv BOOLEAN DEFAULT NULL
);

CREATE INDEX psl_err_index
    ON psl (err);

CREATE INDEX psl_idna_index
    ON psl (idna);

CREATE INDEX psl_is_ip_index
    ON psl (is_ip);

CREATE INDEX psl_is_priv_index
    ON psl (is_priv);

CREATE INDEX psl_reg_dom_index
    ON psl (reg_dom);

CREATE INDEX psl_sub_dom_index
    ON psl (sub_dom);

CREATE INDEX psl_top_dom_index
    ON psl (top_dom);