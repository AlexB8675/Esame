create table Categorie (
    id_categoria int         not null auto_increment,
    nome         varchar(32) not null,

    primary key (id_categoria)
);

create table Oggetti (
    id_oggetto     int          not null auto_increment,
    e_id_categoria int          not null,
    nome           varchar(32)  not null,
    def_it         varchar(32)  not null,
    def_eng        varchar(32)  not null,
    vocale         varchar(256) not null,
    percorso       varchar(256) not null,

    primary key (id_oggetto),
    foreign key (e_id_categoria)
        references Categorie(id_categoria)
            on delete cascade
            on update cascade
);
