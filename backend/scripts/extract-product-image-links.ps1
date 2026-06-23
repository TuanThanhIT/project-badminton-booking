param(
  [Parameter(Mandatory = $true)]
  [string]$DocxPath,

  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not $OutputPath) {
  $OutputPath = Join-Path $PSScriptRoot "..\seeders\data\product-image-links.json"
}

function Get-ParagraphText {
  param(
    [System.Xml.XmlNode]$Paragraph,
    [System.Xml.XmlNamespaceManager]$NamespaceManager
  )

  return (($Paragraph.SelectNodes(".//w:t", $NamespaceManager) | ForEach-Object {
    $_.InnerText
  }) -join "").Trim()
}

$resolvedDocxPath = (Resolve-Path -LiteralPath $DocxPath).Path
$resolvedOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutputPath

if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($resolvedDocxPath)

try {
  $documentEntry = $archive.GetEntry("word/document.xml")
  if (-not $documentEntry) {
    throw "Không tìm thấy word/document.xml trong file DOCX."
  }

  $reader = [System.IO.StreamReader]::new($documentEntry.Open())
  try {
    [xml]$document = $reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }

  $namespaceManager = [System.Xml.XmlNamespaceManager]::new($document.NameTable)
  $namespaceManager.AddNamespace(
    "w",
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  )

  $groups = [ordered]@{}
  $currentGroup = $null
  $urlPattern = "https://res\.cloudinary\.com/[^\s<>]+?(?=https://|$)"

  foreach ($paragraph in $document.SelectNodes("//w:body/w:p", $namespaceManager)) {
    $text = Get-ParagraphText -Paragraph $paragraph -NamespaceManager $namespaceManager
    if (-not $text) {
      continue
    }

    $matches = [regex]::Matches($text, $urlPattern)
    if ($matches.Count -eq 0) {
      $currentGroup = $text.Trim().TrimEnd(":").Trim()
      if (-not $groups.Contains($currentGroup)) {
        $groups[$currentGroup] = [System.Collections.Generic.List[string]]::new()
      }
      continue
    }

    if (-not $currentGroup) {
      throw "Gặp URL trước tiêu đề nhóm: $text"
    }

    foreach ($match in $matches) {
      $url = $match.Value.Trim().TrimEnd(".", ",", ";")
      if (-not $groups[$currentGroup].Contains($url)) {
        $groups[$currentGroup].Add($url)
      }
    }
  }

  $result = [ordered]@{
    sourceFile = [System.IO.Path]::GetFileName($resolvedDocxPath)
    groups = $groups
  }

  $json = $result | ConvertTo-Json -Depth 6
  [System.IO.File]::WriteAllText(
    $resolvedOutputPath,
    $json,
    [System.Text.UTF8Encoding]::new($false)
  )

  foreach ($entry in $groups.GetEnumerator()) {
    Write-Output ("{0}: {1} URL" -f $entry.Key, $entry.Value.Count)
  }

  Write-Output "Đã ghi: $resolvedOutputPath"
}
finally {
  $archive.Dispose()
}
