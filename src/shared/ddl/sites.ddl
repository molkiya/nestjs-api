CREATE TABLE IF NOT EXISTS sites
(
    site        SERIAL
        PRIMARY KEY,
    fqdn        TEXT                                   NOT NULL
        CONSTRAINT sites_pk
            UNIQUE,
    ts          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    psl_ts      TIMESTAMP WITH TIME ZONE,
    created_by  INTEGER                                NOT NULL,
    suppress    BOOLEAN                  DEFAULT FALSE NOT NULL,
    cabinet     BOOLEAN                  DEFAULT FALSE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    assigned_by INTEGER
);