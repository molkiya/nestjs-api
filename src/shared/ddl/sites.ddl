CREATE TABLE IF NOT EXISTS sites
(
    site        serial
        PRIMARY KEY,
    fqdn        text                                   NOT NULL,
    ts          timestamp WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by  integer                                NOT NULL,
    suppress    boolean                  DEFAULT FALSE NOT NULL,
    cabinet     boolean                  DEFAULT FALSE NOT NULL,
    assigned_at timestamp WITH TIME ZONE,
    assigned_by integer,
    CONSTRAINT sites_pk
        UNIQUE (fqdn)
);