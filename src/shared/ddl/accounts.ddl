CREATE TABLE IF NOT EXISTS accounts
(
    account serial
        PRIMARY KEY,
    email   text                                   NOT NULL
        CONSTRAINT accounts_pk
            UNIQUE,
    ts      timestamp WITH TIME ZONE DEFAULT NOW() NOT NULL,
    man     boolean                  DEFAULT FALSE NOT NULL
);