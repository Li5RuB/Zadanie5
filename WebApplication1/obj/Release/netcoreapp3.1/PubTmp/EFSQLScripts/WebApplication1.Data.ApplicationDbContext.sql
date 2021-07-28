IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210728084755_curve')
BEGIN
    CREATE TABLE [Canvases] (
        [Id] int NOT NULL IDENTITY,
        [El] int NOT NULL,
        [X] int NOT NULL,
        [Y] int NOT NULL,
        [Z] int NOT NULL,
        [Height] int NOT NULL,
        [Width] int NOT NULL,
        CONSTRAINT [PK_Canvases] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210728084755_curve')
BEGIN
    CREATE TABLE [Curves] (
        [Id] int NOT NULL IDENTITY,
        [El] int NOT NULL,
        [startX] int NOT NULL,
        [startY] int NOT NULL,
        [endX] int NOT NULL,
        [endY] int NOT NULL,
        CONSTRAINT [PK_Curves] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210728084755_curve')
BEGIN
    CREATE TABLE [Posts] (
        [Id] int NOT NULL IDENTITY,
        [El] int NOT NULL,
        [X] int NOT NULL,
        [Y] int NOT NULL,
        [Z] int NOT NULL,
        [Height] int NOT NULL,
        [Width] int NOT NULL,
        [CurrentText] nvarchar(max) NULL,
        CONSTRAINT [PK_Posts] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210728084755_curve')
BEGIN
    CREATE TABLE [Texts] (
        [Id] int NOT NULL IDENTITY,
        [El] int NOT NULL,
        [X] int NOT NULL,
        [Y] int NOT NULL,
        [Z] int NOT NULL,
        [CurrentText] nvarchar(max) NULL,
        CONSTRAINT [PK_Texts] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210728084755_curve')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20210728084755_curve', N'5.0.8');
END;
GO

COMMIT;
GO

