create table Categorie (
    id   int         not null auto_increment,
    nome varchar(32) not null,

    primary key (id)
);

create table Oggetti (
    id      int          not null auto_increment,
    nome    varchar(32)  not null,
    def_it  varchar(32)  not null,
    def_eng varchar(32)  not null,
    vocale  varchar(256) not null,

    primary key (id)
);
